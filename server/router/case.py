from flask import Blueprint, request, g, send_from_directory
from handlers import case
import os

case_blueprint = Blueprint('case', __name__)

@case_blueprint.route("/", methods=["GET"])
def get_all():
   return case.get_all(g.db)

@case_blueprint.route("/<int:id>", methods=["GET"])
def get_by_id(id):
   return case.get_by_id(g.db, id)

@case_blueprint.route("/", methods=["POST"])
def create_case():
   data = request.json
   return case.create_case(g.db, data.get("title"))

@case_blueprint.route("/<int:id>/step", methods=["POST"])
def create_step(id):
   data = request.json
   return case.create_step(g.db, id, data.get("title"))

@case_blueprint.route("/<int:id>", methods=["PUT"])
def update_case(id):
   data = request.json
   return case.update_case(g.db, id)

@case_blueprint.route("/<int:case_id>/step/<int:step_id>", methods=["PUT"])
def update_step(case_id, step_id):
   data = request.json
   return case.update_step(g.db, case_id, step_id, data.get("content"), data.get("isCompleted"))

@case_blueprint.route("/<int:case_id>/step/<int:step_id>/file", methods=["POST"])
def upload_file(case_id, step_id):
   if "file" not in request.files:
      return {"error": "No file provided"}, 400
   file = request.files["file"]
   if file.filename == "":
      return {"error": "No file selected"}, 400
   return case.upload_file(g.db, case_id, step_id, file)

@case_blueprint.route("/<int:case_id>/step/<int:step_id>/file/<filename>", methods=["GET"])
def download_file(case_id, step_id, filename):
   return case.download_file(g.db, case_id, step_id, filename)

@case_blueprint.route("/<int:case_id>", methods=["DELETE"])
def delete_case(case_id):
   return case.delete_case(g.db, case_id)

@case_blueprint.route("/<int:case_id>/step/<int:step_id>", methods=["DELETE"])
def delete_step(case_id, step_id):
   return case.delete_step(g.db, case_id, step_id)

@case_blueprint.route("/<int:case_id>/step/<int:step_id>/file/<filename>", methods=["DELETE"])
def delete_file(case_id, step_id, filename):
   return case.delete_file(g.db, case_id, step_id, filename)

@case_blueprint.route("/<int:case_id>/step/<int:step_id>/rename", methods=["PUT"])
def rename_step(case_id, step_id):
   data = request.json
   return case.rename_step(g.db, case_id, step_id, data.get("title"))

@case_blueprint.route("/<int:case_id>/steps/reorder", methods=["PUT"])
def reorder_steps(case_id):
   data = request.json
   return case.reorder_steps(g.db, case_id, data.get("step_ids", []))