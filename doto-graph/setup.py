import sys
import shutil
import doto

from pathlib import Path
from setuptools import Command, setup, find_packages
from subprocess import check_call, CalledProcessError

this_dir = Path(__file__).parent.absolute()

# Get the long description from the README file
with this_dir.joinpath('README.md').open(encoding='utf-8') as f:
    long_description = f.read()


def requirements_to_list(filename):
    return [dep for dep in this_dir.joinpath(filename).open().read().split('\n') if (
        dep and not dep.startswith('#')
    )]


class BuildFrontendCommand(Command):
    """ Build the UI """
    description = 'Build doto-ui'
    user_options = [
        ('version=', 'v', 'version of yarn'),
    ]

    def initialize_options(self):
        self.version = '1.2.3'

    def finalize_options(self):
        pass

    def run(self):
        if shutil.which('yarn') is None:
            print('No yarn available.')
            return
        work_dir = this_dir.parent.joinpath('doto-ui')
        try:
            check_call([shutil.which('yarn')], cwd=work_dir)
            check_call([shutil.which('yarn'), 'build'], cwd=work_dir)
        except CalledProcessError as err:
            if 'non-zero' in str(err):
                print("extract failed", file=sys.stderr)
                sys.exit(1)


setup(
    name='doto',
    version=doto.__version__,
    description='Terrible task manager for large touch screens',
    long_description=long_description,
    long_description_content_type='text/markdown',
    url='https://github.com/mikeshultz/doto',
    author=doto.__author__,
    author_email=doto.__email__,
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: GNU General Public License v3 or later (GPLv3+)',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
    ],
    keywords='todo',
    packages=find_packages(exclude=['docs', 'tests', 'scripts', 'build']),
    install_requires=requirements_to_list('requirements.txt'),
    package_data={
        '': [
            'README.md',
        ],
    },
    cmdclass={
        'build_frontend': BuildFrontendCommand,
    }
)
