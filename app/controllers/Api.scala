package controllers

import play.api.mvc._
import models.{Data, Answer, Question, Topic}
import play.api.libs.json.Json
import models.JsonImplicits._


object Api extends Controller {

  var answers = List[Answer]()

  def topics(session: String) = Action {
    val next = for {
      topic <- Data.topics
      question <- topic.questions if answers.filter(a => a.session == session && a.question == question.id).isEmpty
    } yield (topic, question)

    next.headOption match {
      case Some((topic: Topic, question: Question)) =>
        Ok(Json.obj("topic" -> topic, "question" -> question, "replyUrl" -> s"/api/topics/${topic.id}/${question.id}"))
      case _ =>
        NotFound
    }
  }

  def recordAnswer(topicId: String, questionId: String) = Action(parse.json) { request =>
    val newAnswer = request.body.as[Answer]
    answers ::= newAnswer
    Ok("")
  }

}
