import os
from pathlib import Path

SPA_PATH = os.environ.get('SPA_PATH', '../../doto-ui/build')
SQLITE_PATH = Path(os.environ.get('SQLITE_PATH', '~/.config/doto/doto.db')).expanduser().resolve()
