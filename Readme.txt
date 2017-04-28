Readme for Alliance Data Labor App

Prerequisites:
-Have a Tomcat7 server installed on the host machine
-add mysql java connector and gson jars to the libs folder on the tomcat server
-Have a mysql DB running on the same host at port 3306 with:
   -a db user with the username alliance, password labor
   -a db schema with the title application_data

Step 1: Initiallize the database
-After completing the prerequisites, run the DBSetup.jar file in the same folder as the seriesmapping.txt file

Step 2: Mount the WAR
-In the webapps folder place the AllianceLabor.war file (it should automatically extract)

Step 3: Run the server
-Turn the tomcat and mysql servers on
-Navigate to localhost:8080/AllianceLabor/DataPageAdmin.html and the app should be up and running