package models

sealed trait TargetingCriterion

case class GeoFence(longitude: Double, latitude: Double, maximumDistanceInMiles: Double)

case class GeoTargeting(geoFences: Set[GeoFence]) extends TargetingCriterion
case class ReadingHistory(topicIds: Set[String]) extends TargetingCriterion
case class TopicParticipation(topics: Set[String]) extends TargetingCriterion

object Topic {
  def withName(name: String): Topic =
    Topic(
      java.util.UUID.randomUUID().toString,
      name,
      Set.empty,
      Nil
    )
}

case class Topic(
  id: String,
  name: String,
  targetingCriteria: Set[TargetingCriterion],
  questions: List[Question]
)

sealed trait Question {
  val id: String
  val question: String
}

case class MultipleChoice(
  id: String = java.util.UUID.randomUUID().toString,
  question: String,
  choices: List[String]
) extends Question

case class FreeForm(
  id: String,
  question: String
) extends Question

