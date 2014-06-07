package controllers

import play.api.mvc._
import models.Topic
import play.api.data._
import play.api.data.Forms._

case class CreateTopicFormData(name: String)

object Application extends Controller {
  @volatile var topics = List(Topic("example", "Example", Set(), List()))

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

  val createTopicForm = Form(mapping(
    "name" -> text
  )(CreateTopicFormData.apply)(CreateTopicFormData.unapply))

  def createTopic = Action { implicit request: Request[AnyContent] =>
    val formData = createTopicForm.bindFromRequest.get

    val newTopic = Topic(formData.name)

    topics ::= newTopic

    Redirect(s"/topics/${newTopic.id}")
  }
}
