
name := "mit-hack-day"

version := "1.0.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

libraryDependencies ++= Seq(
  "com.gu" %% "content-api-client" % "2.18",
  "com.typesafe.akka" %% "akka-actor" % "2.3"
)

