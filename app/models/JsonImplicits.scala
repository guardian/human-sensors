package models

import play.api.libs.json._

object JsonImplicits {
  implicit class RichJsResult[A](reads: JsResult[A]) {
    def mapTo[AA >: A] = reads.map(a => a: AA)
  }

  implicit val geoFenceFormat = Json.format[GeoFence]
  implicit val geoTargetingFormat = Json.format[GeoTargeting]
  implicit val topicParticipationFormat = Json.format[TopicParticipation]
  implicit val readingHistoryFormat = Json.format[ReadingHistory]

  implicit val targetingCriterionFormat = new Format[TargetingCriterion] {
    override def reads(json: JsValue): JsResult[TargetingCriterion] =
      geoTargetingFormat.reads(json).mapTo[TargetingCriterion] orElse
      topicParticipationFormat.reads(json).mapTo[TargetingCriterion]

    override def writes(o: TargetingCriterion): JsValue = o match {
      case geo: GeoTargeting => geoTargetingFormat.writes(geo)
      case topic: TopicParticipation => topicParticipationFormat.writes(topic)
      case readingHistory: ReadingHistory => readingHistoryFormat.writes(readingHistory)
    }
  }

  implicit val freeFormFormat = Json.format[FreeForm]
  implicit val multipleChoiceFormat = Json.format[MultipleChoice]

  implicit val questionFormat = new Format[Question] {
    override def reads(json: JsValue): JsResult[Question] =
      freeFormFormat.reads(json).mapTo[Question] orElse
        multipleChoiceFormat.reads(json).mapTo[Question]

    override def writes(o: Question): JsValue = o match {
      case freeForm: FreeForm => freeFormFormat.writes(freeForm)
      case multipleChoice: MultipleChoice => multipleChoiceFormat.writes(multipleChoice)
    }
  }

  implicit val topicFormat = Json.format[Topic]
}
