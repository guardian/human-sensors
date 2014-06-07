package controllers

import play.api.mvc._
import models.Topic

object Application extends Controller {
  var topics = List(Topic("example", "Example", Set(), List()))

  def index = Action {
    Ok(views.html.index(topics))
  }

  def topic(id: String) = Action {
    topics.find(_.id == id).map { topic =>
      Ok(views.html.topic(topic))
    } getOrElse {
      NotFound
    }
  }

}
