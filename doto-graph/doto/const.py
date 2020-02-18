import os
from pathlib import Path

SPA_PATH = os.environ.get('SPA_PATH', Path(__file__).parent.joinpath('../../doto-ui/build').expanduser().resolve())
SQLITE_PATH = Path(os.environ.get('SQLITE_PATH', '~/.config/doto/doto.db')).expanduser().resolve()
