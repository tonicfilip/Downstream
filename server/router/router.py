from flask import Blueprint
from router.case import case_blueprint

router_blueprint = Blueprint('/',__name__)
router_blueprint.register_blueprint(case_blueprint, url_prefix="/case")