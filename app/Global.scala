import models.Data
import play.api.libs.concurrent.Akka
import play.api.{Application, GlobalSettings}
import scala.concurrent.duration._
import play.api.Play.current
import scala.concurrent.ExecutionContext.Implicits.global

object Global extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    Data.loadFromFile()

    Akka.system.scheduler.schedule(1 second, 500 millis) {
      Data.persist()
    }

    super.onStart(app)
  }
}
