package controllers

import data.ContentApiClient
import play.api.mvc.{Action, Controller}
import models.{ShortTopic, Data, Tag}
import models.JsonImplicits._
import play.api.libs.json.Json
import scala.concurrent.ExecutionContext.Implicits.global

object NewTopicHelpers extends Controller {
  def lookUpTag(query: String) = Action.async {
    ContentApiClient.tags.q(query).response map { tagResponse =>
      Ok(Json.toJson(tagResponse.results.map(Tag.fromContentApi)))
    }
  }

  def lookUpTopic(query: String) = Action {
    Ok(Json.toJson(Data.topics.find(_.name contains query).map(ShortTopic.fromTopic)))
  }
}
