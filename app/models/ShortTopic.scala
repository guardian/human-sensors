package models

object ShortTopic {
  def fromTopic(topic: Topic) = ShortTopic(topic.id, topic.name)
}

case class ShortTopic(id: String, name: String)
