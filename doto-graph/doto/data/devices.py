import sys
import pywemo
from datetime import datetime, timedelta
from doto.utils import normalize_mac_address


CACHE_DURATION = timedelta(minutes=5)

_device_cache = []
_device_time = None


class DeviceNotFound(Exception): pass


def discover_wemo():
    """ Discover Wemo devices on the network """
    global _device_time, _device_cache

    if _device_time and datetime.now() - _device_time <= CACHE_DURATION:
        return _device_cache

    cache = True
    _device_cache = pywemo.discover_devices()
    _device_time = datetime.now()
    print('discover_wemo _device_cache:', _device_cache)
    if _device_time:
        for i in reversed(range(0, len(_device_cache))):
            if _device_cache[i].mac is None:
                cache = False
                print('Error: Device {} is missing a mac address!'.format(
                    _device_cache[i]
                ), file=sys.stderr)
                # Useless to us
                _device_cache.pop(i)

    returned_devices = _device_cache

    # Reset cache if we got invalid devices
    if cache is False:
        _device_cache = []
        _device_time = None

    return returned_devices


def get_device(mac, devices=None):
    """ Get a specific device """
    print('get_device:', get_device)
    if not mac:
        return None
    if not devices:
        devices = discover_wemo()

    normal_mac = normalize_mac_address(mac)

    for dev in devices:
        if dev.mac and normalize_mac_address(dev.mac) == normal_mac:
            print('get_device dev:', dev)
            return dev

    return None


def device_on(mac):
    dev = get_device(mac)

    if not dev:
        raise DeviceNotFound("Device {} not found".format(mac))

    return dev.on()


def device_off(mac):
    dev = get_device(mac)

    if not dev:
        raise DeviceNotFound("Device {} not found".format(mac))

    return dev.off()


def device_toggle(mac):
    dev = get_device(mac)

    if not dev:
        raise DeviceNotFound("Device {} not found".format(mac))

    return dev.toggle()


def get_devices(mac=None):
    """ Return devices for cosumption by graphql """
    wemo_devices = discover_wemo()

    if mac:
        dev = get_device(mac, wemo_devices)
        if not dev:
            return []
        return [dev]

    return wemo_devices
