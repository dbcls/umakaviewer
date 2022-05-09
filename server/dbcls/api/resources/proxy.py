from flask_restful import Resource, request
from SPARQLWrapper import SPARQLWrapper, JSON



class Proxy(Resource):
    def post(self):
        form = request.form
        endpoint = form['endpoint']
        query = form['query']
        s = SPARQLWrapper(endpoint)
        s.setTimeout(1800)
        s.setQuery(query)
        s.setReturnFormat(JSON)
        res = s.query().convert()
        return res
