import json
import caldav
from datetime import datetime
from caldav.elements import dav, cdav
from caldav.lib.error import AuthorizationError
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from requests.auth import AuthBase

from doto.const import CONFIG_DIR, GOOGLE_CAL_URL_TMPL, GOOGLE_AUTH_REDIRECT

CLIENT_SECRETS_CACHE = None
CREDS_CACHE = {}
TOKEN_CACHE = None


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


# def get_google_flow(state = None):
#     """ Get a Google auth flow """
#     scopes = [
#         'https://www.googleapis.com/auth/calendar',
#         'https://www.googleapis.com/auth/calendar.events'
#     ]

#     flow = Flow.from_client_config(CLIENT_SECRETS_CACHE, scopes=scopes)
#     flow.redirect_uri = 'http://doto.mikes.network'
#     auth_url, state = flow.authorization_url(request_token=state)
#     if code is not None:
#         flow.fetch_token(code=code)
#     return flow


def authorize_user_step1(calendar_id):
    """ Start the authorization steps for a user """
    global CREDS_CACHE, CLIENT_SECRETS_CACHE

    if CLIENT_SECRETS_CACHE is None:
        load_client_secret()

    scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
    ]

    flow = Flow.from_client_config(CLIENT_SECRETS_CACHE, scopes=scopes)
    flow.redirect_uri = GOOGLE_AUTH_REDIRECT
    auth_url, state = flow.authorization_url()
    print('saving state:', state)
    CREDS_CACHE[state] = {
        'calendar_id': calendar_id,
        'state': state,
        'code': None,
        'scope': scopes
    }

    save_credentials()

    return auth_url


def authorize_user_step2(state, code):
    """ Finish the authorization steps for a user """
    global TOKEN_CACHE, CREDS_CACHE, CLIENT_SECRETS_CACHE

    if TOKEN_CACHE is None:
        load_credentials()

    if state not in CREDS_CACHE:
        return False

    scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
    ]

    flow = Flow.from_client_config(CLIENT_SECRETS_CACHE, scopes=scopes)
    flow.redirect_uri = GOOGLE_AUTH_REDIRECT
    tokens = flow.fetch_token(code=code)
    CREDS_CACHE[state]['code'] = code
    calendar_id = CREDS_CACHE[state]['calendar_id']
    TOKEN_CACHE[calendar_id] = tokens
    del CREDS_CACHE[state]

    save_credentials()

    return True


def get_calendars(calendar_id=None):
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
        if expires_at and datetime.fromtimestamp(expires_at) < datetime.now():
            print('Credentials expired for calendar {}'.format(cal_id))
            continue
        access_token = TOKEN_CACHE[cal_id].get('access_token')
        try:
            # Credentials(token, refresh_token=None, id_token=None, token_uri=None, client_id=None, client_secret=None, scopes=None)
            credentials = Credentials(access_token)
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


def get_calendar(calendar_id):
    """ Get a full calendar data from Google """

    expires_at = TOKEN_CACHE[calendar_id].get('expires_at')
    if expires_at and datetime.fromtimestamp(expires_at) < datetime.now():
        raise Exception('Unauthorized: Credentials expired for calendar {}'.format(calendar_id))

    access_token = TOKEN_CACHE[calendar_id].get('access_token')
    # Credentials(token, refresh_token=None, id_token=None, token_uri=None, client_id=None, client_secret=None, scopes=None)
    credentials = Credentials(access_token)
    client = caldav.DAVClient(
        GOOGLE_CAL_URL_TMPL.format(calendar_id),
        auth=OAuth(credentials)
    )
    principal = client.principal()
    return principal.calendars()
