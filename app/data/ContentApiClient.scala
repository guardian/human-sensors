package data

import com.gu.openplatform.contentapi.FutureAsyncApi
import scala.concurrent.ExecutionContext.Implicits.global
import com.gu.openplatform.contentapi.connection.DispatchAsyncHttp

object ContentApiClient extends FutureAsyncApi with DispatchAsyncHttp {
  implicit val executionContext = global

  apiKey = Some("media-labs-hackathon")
}
