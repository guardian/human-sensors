package models

case class Topic(
  name: String,
  questions: List[Question]
)

sealed trait Question

case class MultipleChoice(
  question: String,
  choices: List[String]
) extends Question

case class FreeForm(
  question: String
) extends Question

