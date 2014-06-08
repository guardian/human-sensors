package models

import JsonImplicits._
import play.api.libs.json.{JsValue, Json}
import java.io.{File, PrintWriter}
import grizzled.slf4j.Logging
import scala.io.Source

object Data extends Logging {
  @volatile var topics = List.empty[Topic]
  @volatile var answers = List[Answer]()
  @volatile var locations = Map[String, Location]()

  private val topicFileName = "conf/persistence/topics.json"
  private val answersFileName = "conf/persistence/answers.json"
  private val locationsFileName = "conf/persistence/locations.json"

  def loadFromFile() {
    try {
      topics = Json.parse(Source.fromFile(topicFileName).mkString).as[List[Topic]]
      logger.info(s"Loaded ${topics.size} topics from $topicFileName")

      answers = Json.parse(Source.fromFile(answersFileName).mkString).as[List[Answer]]
      logger.info(s"Loaded ${answers.size} topics from $answersFileName")

      locations = Json.parse(Source.fromFile(locationsFileName).mkString).as[Map[String, Location]]
      logger.info(s"Loaded ${locations.size} topics from $locationsFileName")

    } catch {
      case error: Throwable =>
        logger.error(s"Could not load data", error)
    }
  }

  def persist() {
    persist1(Json.toJson(topics),    topicFileName)
    persist1(Json.toJson(answers),   answersFileName)
    persist1(Json.toJson(locations), locationsFileName)
  }

  def persist1(data: JsValue, fileName: String) {
    val jsonString = Json.stringify(data)

    val file = new File(fileName)
    val out = new PrintWriter(file, "UTF-8")

    try {
      out.print(jsonString)
      out.flush()
      out.close()
    } catch {
      case error: Throwable =>
        logger.error("Error attempting to persist data", error)
    }
  }
}
