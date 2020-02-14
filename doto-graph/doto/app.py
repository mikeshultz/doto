import os
from flask import Flask, escape, request
from flask_graphql import GraphQLView
from flask_cors import CORS

from doto.schema import schema
from doto.const import SPA_PATH

app = Flask(__name__, static_folder=SPA_PATH)
CORS(app)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    print('path:', path)
    return app.send_static_file(path or 'index.html')


app.add_url_rule('/graphql', view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True))

# Optional, for adding batch query support (used in Apollo-Client)
app.add_url_rule('/graphql/batch', view_func=GraphQLView.as_view('graphql-batch', schema=schema, batch=True))
