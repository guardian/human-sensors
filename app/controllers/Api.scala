package controllers

import play.api.mvc._
import models._
import Data.{topics, answers, locations}
import play.api.libs.json.Json
import models.JsonImplicits._
import models.Answer
import scala.Some


object Api extends Controller {

  val corsHeaders = Seq(("Access-Control-Allow-Origin" -> "*"),("Access-Control-Allow-Headers", "Content-Type"))

  def listTopics(session: String) = Action {
    val next = for {
      topic <- topics
      question <- topic.questions if answers.filter(a => a.session == session && a.question == question.id).isEmpty
    } yield (topic, question)

    next.headOption match {
      case Some((topic: Topic, question: Question)) =>
        Ok(Json.obj("topic" -> topic, "question" -> question,
          "replyUrl" -> s"/api/topics/${topic.id}/${question.id}",
          "trackUrl" -> s"/api/locations?session=$session"
        )).
          withHeaders(corsHeaders:_*)
      case _ =>
        NotFound.withHeaders(corsHeaders:_*)
    }
  }

  // FIXME: lost every time?
  def listAnswers(topicId: String, questionId: String) = Action {
    val matchingAnswers = answers.filter(answer => answer.topic == topicId && answer.question == questionId)
    Ok(Json.arr(matchingAnswers)).withHeaders(corsHeaders:_*)
  }

  def recordAnswer(topicId: String, questionId: String) = Action(parse.json) { request =>
    val newAnswer = request.body.as[Answer]
    answers ::= newAnswer

    val topicAnswers = answers.filter(_.topic == topicId).filter(_.question == questionId)
    val results = topicAnswers.
      groupBy(_.value).
      mapValues((_.size.toDouble / topicAnswers.size * 100)).
      toList

    Ok(Json.obj("results" -> results.map(res => Json.obj("answer" -> res._1, "percent" -> res._2)))).
      withHeaders(corsHeaders:_*)
  }

  def listLocations = Action {
    Ok(Json.arr(locations)).withHeaders(corsHeaders:_*)
  }

  def updateLocation(session: String) = Action(parse.json) { request =>
    val location = request.body.as[Location]
    locations += (session -> location)

    Ok("").withHeaders(corsHeaders:_*)
  }

  def corsOk(topicId: String, questionId: String) = Action {
    Ok.withHeaders(corsHeaders:_*)
  }

}
