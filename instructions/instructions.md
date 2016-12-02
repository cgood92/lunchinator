You have been asked to implement the back-end service for _Lunchinator 3000_, a new software application that answers
the question "Where to for lunch?" Each day, Lunchinator 3000 chooses a list of suggested restaurants from your lunch
group's restaurant list, collects and tallies the votes, and then decides where you are going to eat. No more standing
on the sidewalk talking about where to go for lunch!

As the back-end engineer for this project, you must develop a working service that implements all of the requirements
below. You may choose any current technology: Java, NodeJS, PHP, etc. The service must authenticate users using HTTP
Basic authentication against the list of users in `users.csv`.

We will test your implementation and evaluate your code. Some of the things we are evaluating are:

* Functionality (Does your code work correctly?)
* Code structure and style (Is your code DRY? How complex is your code? Is your code readable?)
* Documentation / self-documenting code (Can another developer understand how your code works?)
* Error handling (What happens when an error occurs?)
* Testing (Does your code include unit tests?)

## Restaurant data

The service must store a list of restaurants with two attributes: a numeric ID and the restaurant name. When your
service starts up, it should initialize itself with the list of restaurants in `restaurants.csv`. Data does not need to
persist when the service is restarted -- just load the data from the CSV file each time the service is restarted.

## Restaurant voting

The user interface will be built by the front-end team using Hot New JavaScript Framework 1.0. Users will cast their
votes for restaurants, which the application will pass to your service. By default, voting should end at 11:45 AM, but
this time can be modified by an API call (below). When the voting period ends, the service tallies the votes to
determine where to go for lunch.

## Tweet voting results

After the voting deadline passes for the day, the service must send a tweet with the restaurant selected for lunch. The
tweet must read "Where to for lunch? _restaurant name_!" If no one has cast any votes for the day, the service must send
a tweet that reads "Good luck with lunch today."

## GET /api/restaurants/

The service provides a list of all restaurants configured for the lunch group.

#### Example JSON response for `GET /api/restaurants/`
<pre>
[
  { "id": 1, "name": "Costa Vida" },
  { "id": 2, "name": "Jimmy John's" },
  { "id": 3, "name": "Buffalo Wild Wings" },
  { "id": 4, "name": "Chick-Fil-A" },
  { "id": 5, "name": "Cafe Rio" },
  { "id": 6, "name": "Arby's" },
  { "id": 7, "name": "Marco's Pizza" },
  { "id": 8, "name": "Firehouse Subs" },
  { "id": 9, "name": "Habit Burger" },
  { "id": 10, "name": "Popeye's" },
  { "id": 11, "name": "Taco Time" },
  { "id": 12, "name": "Panda Express" },
  { "id": 13, "name": "Rock Creek Pizza Company" },
  { "id": 14, "name": "Astro Burger" },
  { "id": 15, "name": "Cafe Zupas" },
  { "id": 16, "name": "DP Cheesesteak" },
  { "id": 17, "name": "In-n-Out Burger" },
  { "id": 18, "name": "Kneaders" },
  { "id": 19, "name": "Goodwood Barbecue Company" },
  { "id": 20, "name": "Five Guys" }
]
</pre>

## GET /api/restaurants/_id_

The service provides data for a specific restaurant.

#### Example JSON response for `GET /api/restaurants/1`

<pre>{ "id": 1, "name": "Costa Vida" }</pre>

## PUT /api/restaurants/_id_

The service allows a user to update the data stored for an existing restaurant. After the restaurant data is updated,
this method returns the updated restaurant object. The `id` property of the restaurant object is optional. If the
restaurant object passed to the method includes as `id` parameter, it must be ignored. (Attempting to call
`PUT /api/restaurants/15` with an ID of 14 in the object updates restaurant 15 without changing the ID.)

#### Example JSON request for `PUT /api/restaurants/20`

<pre>{ "name": "Five Guys Burgers and Fries" }</pre>

#### Example JSON response for `PUT /api/restaurants/20`

<pre>{ "id": 20, "name": "Five Guys Burgers and Fries" }</pre>

## DELETE /api/restaurants/_id_

The service allows a user to delete the information stored for an existing restaurant. This request does not return any
data.

## POST /api/restaurants

The service allows the user to add information for a new restaurant. If a restaurant object passed to a POST request
includes an ID, it is ignored. The service returns the newly-created restaurant object.

#### Example JSON request for `POST /api/restaurants/`

<pre>{ "name": "Dickey's Barbecue Pit" }</pre>

#### Example JSON response for `POST /api/restaurants/`

<pre>{ "id": 21, "name": "Dickey's Barbecue Pit" }</pre>

## GET /api/ballot

The service randomly selects a list of no more than five suggested restaurants for lunch. Each ballot request must
return the same list of restaurants with the restaurants listed in a random order (two successive calls to
`GET /api/ballot` should almost never generate the list in the same order). The server must return a 409 response if the
voting deadline has passed.

#### Example JSON response for `GET /api/restaurants/`
<pre>
[
  { "id": 4, "name": "Chick-Fil-A" },
  { "id": 16, "name": "DP Cheesesteak" },
  { "id": 6, "name": "Arby's" },
  { "id": 2, "name": "Jimmy John's" },
  { "id": 10, "name": "Popeye's" }
]
</pre>

## POST /api/vote

A user can cast their vote for where to eat for lunch. The request must include the numeric restaurant ID as a query
parameter. This request does not return any data. If a user votes twice, the user's first vote is discarded and replaced
with the later vote. The server must return a 409 response if the voting deadline has passed.

#### Example request for `POST /api/vote`

<pre>POST /api/vote?id=15</pre>

## POST /api/voting-closes

(This is to simplify testing your API.) The service allows a user to set the time that voting closes. This method must
accept a query parameter with the closing time for voting formatted as a 24-hour time as indicated below.

#### Example request for `POST /api/voting-closes`

<pre>POST /api/voting-closes?time=1330</pre>

## POST /api/tomorrow

(This is to simplify testing your API.) This method simulates a new day for testing. When this method is called, the
service must reset its state as though it were a new day. This means that subsequent calls to `GET /api/ballot` return a
new list of restaurants.

## Stretch goals

If you are looking for a little bigger challenge, you can optionally implement one or both of the following features.

#### One o'clock meetings

Some restaurants are slow and won't work if someone in the group has a one o'clock meeting. Support this by making
the following changes:

* Modify the restaurant object to include a new boolean property called `isSlow`. This should be returned as part of
  the API response for all calls that return restaurant objects. The POST and PUT methods that update restaurants must
  accept and store this property value.
* The `/api/ballot` method must never return more than two restaurants where the `isSlow` property is true.
* Modify the `/api/vote` method to accept an additional query parameter called `onePmMeeting`. This parameter is
  optional and may be either `true` or `false`. If the parameter is omitted, assume the value is `false`. 
* When at least one person has indicated that they have a 1:00 PM meeting, the tweet must include "Better hurry!!" after
  the restaurant name. ("Where to for lunch? Restaurant name! Better hurry!!")

#### Don't repeat restaurants

It isn't any fun to eat at the same place every day. Prevent this by making the following changes:

* Modify the restaurant object to include a new numeric property called `daysAgo`. This should be returned as part of
  the API response for all calls that return restaurant objects. The POST and PUT methods that update restaurants must
  accept and store this property value.
* When selecting restaurants for the ballot, do not include restaurants visited less than five days ago.
* When a new day begins, increment the `daysAgo` property for each restaurant in the database. Do not update the
  restaurants if there were no votes cast during the day that just ended.

#### Admin users

Seniority has its privileges. One of the privileges that new people do not get is the privilege to update the restaurant
list. Support this by making the following changes:

* Modify the user object to include a new boolean property called `admin`.
* Modify the user list to grant admin privilege to amber, brian, carl, and david.
* Modify the API to only allow admin users to call any methods under `/api/restaurants/`.
