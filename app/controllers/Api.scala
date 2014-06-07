package controllers

import play.api.mvc._
import models.Topic

object Api extends Controller {

  def topics = Action {
    // Application.topics
//    Ok(Application.topics)
    Ok("return the topics")
  }

}
