from jinja2 import Markup

def datetimeformat(value, format='%Y-%m-%d %H:%M '):
    return Markup(value.strftime(format))
