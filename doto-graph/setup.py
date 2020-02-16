import doto
from os import path
from setuptools import setup, find_packages

pwd = path.abspath(path.dirname(__file__))

# Get the long description from the README file
with open(path.join(pwd, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()


def requirements_to_list(filename):
    return [dep for dep in open(path.join(pwd, filename)).read().split('\n') if (
        dep and not dep.startswith('#')
    )]


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
    }
)
