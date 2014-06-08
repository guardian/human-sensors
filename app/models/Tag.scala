package models

import com.gu.openplatform.contentapi.model.{Tag => ContentApiTag}

object Tag {
  def fromContentApi(tag: ContentApiTag) = Tag(tag.id, tag.webTitle)
}

case class Tag(
  id: String,
  name: String
)
