package models

import play.api.libs.json.{JsResult, JsValue, Format, Json}

object JsonImplicits {
  implicit val freeFormFormat = Json.format[FreeForm]
  implicit val multipleChoiceFormat = Json.format[MultipleChoice]

  implicit val questionFormat = new Format[Question] {
    override def reads(json: JsValue): JsResult[Question] =
      freeFormFormat.reads(json).map(x => x: Question) orElse
        multipleChoiceFormat.reads(json).map(x => x: Question)

    override def writes(o: Question): JsValue = o match {
      case freeForm: FreeForm => Json.writes[FreeForm].writes(freeForm)
      case multipleChoice: MultipleChoice => Json.writes[MultipleChoice].writes(multipleChoice)
    }
  }

  implicit val topicFormat = Json.format[Topic]
}
