import json
import caldav
from datetime import datetime, timedelta
from caldav.elements import dav, cdav
from caldav.lib.error import AuthorizationError
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from requests.auth import AuthBase

from doto.const import CONFIG_DIR, GOOGLE_CAL_URL_TMPL, GOOGLE_AUTH_REDIRECT

CLIENT_SECRETS_CACHE = None
TEMP_CREDS_CACHE = {}
TOKEN_CACHE = None
CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
# CALENDAR_SCOPES = [
#     'https://www.googleapis.com/auth/calendar',
#     'https://www.googleapis.com/auth/calendar.events'
# ]


class OAuth(AuthBase):
    def __init__(self, credentials):
        self.credentials = credentials

    def __call__(self, r):
        self.credentials.apply(r.headers)
        return r


def config_dir_init(confd):
    """ Make sure the config confd exists and all that """
    if confd.is_file():
        raise Exception('Directory conflict.  File at {}'.format(confd))
    if not confd.is_dir():
        confd.mkdir(parents=True)
    return confd.is_dir()


def load_json_file(json_file):
    """ Load a JSON file to a Pyton dict """

    if not json_file.is_file():
        raise FileNotFoundError('json file {} missing!'.format(json_file))

    file_text = json_file.read_text()
    return json.loads(file_text)


def save_json_file(json_file, obj):
    """ Load a JSON file to a Pyton dict """
    return json_file.write_text(json.dumps(obj))


def load_client_secret(fname='client_secret.json', confd=CONFIG_DIR):
    """ Load the client_secret.json file """
    global CLIENT_SECRETS_CACHE
    config_dir_init(confd)
    CLIENT_SECRETS_CACHE = load_json_file(confd.joinpath(fname))
    if CLIENT_SECRETS_CACHE is None:
        raise FileNotFoundError('Missing client_secret.json')
    return CLIENT_SECRETS_CACHE


def load_credentials(fname='apicreds.json', confd=CONFIG_DIR):
    global TOKEN_CACHE
    config_dir_init(confd)
    TOKEN_CACHE = load_json_file(confd.joinpath(fname))
    if TOKEN_CACHE is None:
        TOKEN_CACHE = {}
    return TOKEN_CACHE


def save_credentials(fname='apicreds.json', confd=CONFIG_DIR):
    """ Save credentials """
    global TOKEN_CACHE
    return save_json_file(confd.joinpath(fname), TOKEN_CACHE)


def credentials_to_dict(c, **kwargs):
    dict_out = {
        'token': c.token,
        'refresh_token': c.refresh_token,
        'id_token': c.id_token,
        'token_uri': c.token_uri,
        'client_id': c.client_id,
        'client_secret': c.client_secret,
        'scopes': c.scopes
    }
    if kwargs:
        dict_out.update(kwargs)
    return dict_out


def dict_to_credentials(d):
    return Credentials(
        token=d.get('token'),
        refresh_token=d.get('refresh_token'),
        id_token=d.get('id_token'),
        token_uri=d.get('token_uri'),
        client_id=d.get('client_id'),
        client_secret=d.get('client_secret'),
        scopes=d.get('scopes')
    )


def authorize_user_step1(calendar_id):
    """ Start the authorization steps for a user """
    global TEMP_CREDS_CACHE, CLIENT_SECRETS_CACHE

    if CLIENT_SECRETS_CACHE is None:
        load_client_secret()

    auth_email = None
    if '@' in calendar_id:
        auth_email = calendar_id
    flow = Flow.from_client_config(CLIENT_SECRETS_CACHE, scopes=CALENDAR_SCOPES)
    flow.redirect_uri = GOOGLE_AUTH_REDIRECT
    auth_url, state = flow.authorization_url(
        access_type='offline',
        prompt='consent',
        login_hint=auth_email,
        include_granted_scopes='true'
    )

    TEMP_CREDS_CACHE[state] = {
        'calendar_id': calendar_id,
        'state': state,
        'code': None,
        'scope': CALENDAR_SCOPES
    }

    save_credentials()

    return auth_url


def authorize_user_step2(state, code):
    """ Finish the authorization steps for a user """
    global TOKEN_CACHE, TEMP_CREDS_CACHE, CLIENT_SECRETS_CACHE

    if TOKEN_CACHE is None:
        load_credentials()

    if state not in TEMP_CREDS_CACHE:
        return False

    flow = Flow.from_client_config(CLIENT_SECRETS_CACHE, scopes=CALENDAR_SCOPES)
    flow.redirect_uri = GOOGLE_AUTH_REDIRECT
    tokens = flow.fetch_token(code=code)
    credentials = flow.credentials
    TEMP_CREDS_CACHE[state]['code'] = code
    calendar_id = TEMP_CREDS_CACHE[state]['calendar_id']
    TOKEN_CACHE[calendar_id] = credentials_to_dict(credentials, expires_at=tokens.get('expires_at'))
    del TEMP_CREDS_CACHE[state]

    save_credentials()

    return True


def get_all_calendars(calendar_id=None):
    """ Fetch a user's calendars """
    global TOKEN_CACHE

    if TOKEN_CACHE is None:
        load_credentials()

    calendars_to_fetch = []
    calendars = []

    if calendar_id is not None and calendar_id not in TOKEN_CACHE:
        raise Exception('You must authenticate first')
    elif calendar_id is not None:
        calendars_to_fetch.append(calendar_id)
    else:
        calendars_to_fetch = TOKEN_CACHE.keys()

    for cal_id in calendars_to_fetch:
        expires_at = TOKEN_CACHE[cal_id].get('expires_at')
        credentials = dict_to_credentials(TOKEN_CACHE[cal_id])
        if expires_at and datetime.fromtimestamp(expires_at) < datetime.now():
            print('Credentials expired for calendar {}'.format(cal_id))
            credentials.refresh(Request())
            TOKEN_CACHE[cal_id] = credentials_to_dict(credentials)
            save_credentials()
        try:
            client = caldav.DAVClient(
                GOOGLE_CAL_URL_TMPL.format(cal_id),
                auth=OAuth(credentials)
            )
            principal = client.principal()
            calendars.extend(principal.calendars())
        except AuthorizationError as err:
            print('Error fetching calendar {}: {}'.format(cal_id, err))

    return calendars


def get_calendar_ids():
    """ Fetch the available calendars """
    global TOKEN_CACHE

    if TOKEN_CACHE is None:
        load_credentials()

    return TOKEN_CACHE.keys()


def get_calendars(calendar_id):
    """ Get a full calendar data from Google """
    global TOKEN_CACHE

    if TOKEN_CACHE is None:
        load_credentials()

    if calendar_id not in TOKEN_CACHE:
        return authorize_user_step1(calendar_id)

    expires_at = TOKEN_CACHE[calendar_id].get('expires_at')
    credentials = dict_to_credentials(TOKEN_CACHE[calendar_id])
    if expires_at and datetime.fromtimestamp(expires_at) < datetime.now():
        print('Credentials expired for calendar {}. Attempting to refresh credentials...'.format(calendar_id))
        credentials.refresh(Request())
        TOKEN_CACHE[calendar_id] = credentials_to_dict(credentials)
        save_credentials()
    service = build('calendar', 'v3', credentials=credentials)
    calendars_result = service.calendarList().list(maxResults=100).execute()
    calendars = calendars_result.get('items', [])
    return calendars


def get_events(calendar_id): #, user_id=None):
    """ Get a full calendar data from Google """
    global TOKEN_CACHE

    if TOKEN_CACHE is None:
        load_credentials()

    if calendar_id not in TOKEN_CACHE:
        print('!!!! auth needs to be done')
        return authorize_user_step1(calendar_id)

    expires_at = TOKEN_CACHE[calendar_id].get('expires_at')
    credentials = dict_to_credentials(TOKEN_CACHE[calendar_id])
    if expires_at and datetime.fromtimestamp(expires_at) < datetime.now():
        print('Credentials expired for calendar {}. Attempting to refresh credentials...'.format(
            calendar_id
        ))
        credentials.refresh(Request())
        TOKEN_CACHE[calendar_id] = credentials_to_dict(credentials)
        save_credentials()
    service = build('calendar', 'v3', credentials=credentials)

    min_datetime = '{}Z'.format(datetime.utcnow().isoformat(timespec='seconds'))
    max_datetime = '{}Z'.format(
        (datetime.utcnow() + timedelta(days=7)).replace(
            hour=23,
            minute=59,
            second=59
        ).isoformat(timespec='seconds')
    )

    events_result = service.events().list(
        calendarId=calendar_id,
        timeMin=min_datetime,
        timeMax=max_datetime,
        maxResults=10,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    return events_result.get('items', [])
