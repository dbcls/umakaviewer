from flask_restful import Resource, reqparse, request
from SPARQLWrapper import SPARQLWrapper, JSON



class Proxy(Resource):
    def post(self):
        form = request.form
        endpoint = form['endpoint']
        query = form['query']
        s = SPARQLWrapper(endpoint)
        s.setQuery(query)
        s.setReturnFormat(JSON)
        res = s.query().convert()
        return res
