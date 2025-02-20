FROM python:3.8-slim

WORKDIR /app
ENV APP_ENV=production

RUN apt-get update && apt-get install -y \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install poetry

RUN poetry config virtualenvs.create false

COPY  ./ ./

RUN poetry install

CMD [ "sh", "entrypoint.sh" ]
