
name := "human-sensors"

version := "1.0.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

libraryDependencies ++= Seq(
  "com.gu" %% "content-api-client" % "2.18",
  "org.clapper" %% "grizzled-slf4j" % "1.0.1"
)

