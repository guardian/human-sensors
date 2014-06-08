package models

import JsonImplicits._
import play.api.libs.json.Json
import java.io.{File, PrintWriter}
import grizzled.slf4j.Logging
import scala.io.Source

object Data extends Logging {
  @volatile var topics = List.empty[Topic]
  @volatile var answers = List[Answer]()
  @volatile var locations = Map[String, Location]()

  private val FileName = "data.json"

  def loadFromFile() {
    try {
      val newTopics = Json.parse(Source.fromFile(FileName).mkString).as[List[Topic]]

      logger.info(s"Loaded ${topics.length} topics from $FileName")

      topics = newTopics
    } catch {
      case error: Throwable =>
        logger.error(s"Could not load topics from $FileName", error)
    }
  }

  def persist() {
    val jsonString = Json.stringify(Json.toJson(topics))

    val file = new File(FileName)
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
