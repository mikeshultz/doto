import os
from pathlib import Path

from doto.utils import any_falsey

SPA_PATH = os.environ.get('SPA_PATH', Path(__file__).parent.joinpath('../../doto-ui/build').expanduser().resolve())
SQLITE_PATH = Path(os.environ.get('SQLITE_PATH', '~/.config/doto/doto.db')).expanduser().resolve()
CONFIG_DIR = Path('~/.config/doto').expanduser().resolve()
ROOT_URL = os.environ.get('ROOT_URL', 'http://localhost:8081')
#GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CAL_URL_TMPL = 'https://apidata.googleusercontent.com/caldav/v2/{}/user'
GOOGLE_AUTH_REDIRECT = '{}/google-auth'.format(ROOT_URL)
OWM_API_KEY = os.environ.get('OWM_API_KEY')
FORECAST_API = 'https://api.openweathermap.org/data/2.5/forecast?zip={zip},{country_code}&appid={api_key}&units=imperial'
DEFAULT_ZIP = '59801'
DEFAULT_COUNTRY_CODE = 'US'
OWM_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'

# if any_falsey([GOOGLE_CLIENT_ID]):
#     raise Exception('Invalid configuration')
