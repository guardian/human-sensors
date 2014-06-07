package models

object Data {
  @volatile var topics = List(Topic("example", "Example", Set(), List()))
}
