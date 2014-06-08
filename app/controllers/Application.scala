package controllers

import play.api.mvc._
import models.{Data, MultipleChoice, Topic}
import Data.{topics, answers, locations}
import play.api.data._
import play.api.data.Forms._

case class CreateTopicFormData(name: String, trackGeo: Boolean)
case class AddQuestionFormData(question: String, `type`: String, answer1: String, answer2: String, answer3: String, answer4: String) {
  def answers = List(answer1, answer2, answer3, answer4).filterNot(_.isEmpty)
}

object Application extends Controller {
  def indexRedirect = Action {
    Redirect("/editor")
  }

  def newTopic = Action {
    Ok(views.html.create_topic())
  }

  def index = Action {
    Ok(views.html.index(topics))
  }

  def topic(id: String) = Action {
    topics.find(_.id == id).map { topic =>
      Ok(views.html.topic(topic, locations))
    } getOrElse {
      NotFound
    }
  }

  val createTopicForm = Form(mapping(
    "name" -> text,
    "trackGeo" -> boolean
  )(CreateTopicFormData.apply)(CreateTopicFormData.unapply))

  val addQuestionForm = Form(mapping(
    "question" -> text,
    "type" -> text,
    "answer-1" -> text,
    "answer-2" -> text,
    "answer-3" -> text,
    "answer-4" -> text
  )(AddQuestionFormData.apply)(AddQuestionFormData.unapply))

  def createTopic = Action { implicit request: Request[AnyContent] =>
    val formData = createTopicForm.bindFromRequest.get

    val newTopic = Topic.withNameAndGeo(formData.name, formData.trackGeo)

    topics ::= newTopic

    Redirect(s"/editor/topics/${newTopic.id}")
  }

  def addQuestion(id: String) = Action { implicit request: Request[AnyContent] =>
    val formData = addQuestionForm.bindFromRequest.get

    formData.`type` match {
      case "choices" => {
        val newQuestion = MultipleChoice(question = formData.question, choices = formData.answers)
        topics = topics.map { topic =>
          if (topic.id == id) {
            topic.copy(questions = topic.questions :+ newQuestion)
          } else topic
        }

        Redirect(s"/editor/topics/$id")
      }
      case _ => BadRequest
    }
  }

  def countAnswers(topicId: String, questionId: String): Int = {
    answers.filter(_.topic == topicId).filter(_.question == questionId).size
  }

  def answerPercentage(topicId: String, questionId: String): Double = {
    val total = answers.filter(_.topic == topicId).size
    if (total == 0) 0
    else countAnswers(topicId, questionId).toDouble / total
  }
}
