FROM python:3.9-slim

WORKDIR /app
ENV APP_ENV=production

RUN pip install poetry

RUN poetry config virtualenvs.create false

COPY  ./ ./

RUN poetry install

CMD [ "sh", "entrypoint.sh" ]
