package models

case class Topic(
  id: String,
  name: String,
  questions: List[Question]
)

sealed trait Question {
  val question: String
}

case class MultipleChoice(
  question: String,
  choices: List[String]
) extends Question

case class FreeForm(
  question: String
) extends Question

