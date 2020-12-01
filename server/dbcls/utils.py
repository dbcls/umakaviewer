import pytz


JST = pytz.timezone('Asia/Tokyo')


def localize_as_utc(naive_datetime):
    return pytz.UTC.localize(naive_datetime)


def localize_as_jst(naive_datetime):
    return localize_as_utc(naive_datetime).astimezone(JST)
