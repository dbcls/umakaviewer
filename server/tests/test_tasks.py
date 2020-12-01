from pathlib import Path

from dbcls.models import User, DataSet
from dbcls.tasks import generate_by_umakaparser
from .fixtures import client, users, data_sets, ontology_path, sbm_path


class TestGenerateByUmakaparser:
    def test_generate(self, client, users, data_sets, ontology_path, sbm_path):
        with client:
            user = User.query.first()
            user_data_set_query = DataSet.query.filter_by(user=user)
            previous_count = user_data_set_query.count()
            generate_by_umakaparser(user.id, ontology_path, sbm_path)
            assert user_data_set_query.count() == previous_count + 1
            assert not Path(ontology_path).exists()
            assert not Path(sbm_path).exists()
