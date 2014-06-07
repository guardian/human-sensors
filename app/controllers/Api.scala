package controllers

import play.api.mvc._
import models.Topic
import play.api.libs.json.Json
import models.JsonImplicits._

object Api extends Controller {
  def topics = Action {
    Ok(Json.toJson(Application.topics))
  }
}
