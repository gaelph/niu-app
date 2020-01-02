# Things to do

## Components with behaviour to split

 - hold
    - [x] HoldModal
 - rules
    - [x] Rule List : There is behaviour in the Item view that should be moved to the List facade
 - shared
    - [x] Temperature Picker
    - [x] Temperature Set Modal : There is also code for a button that should be separated from it
 - others
    - [x] AppBar and SettingsBar : spit behaviour and use a common view

## BoilerHistory

  Use the same trick used with temperature records to only fetch events that occured since last fetch

## BoilerStatus

  Find a more clever way to check the status than polling every 30 seconds (keeps the could function awake...)
  For example:

    - poll every 2 minutes by default
    - poll frequently for 30 seconds after a rule/settings/hold change
    - poll increase the polling frequency as temperature gets closer to limits of the temperature range
      I mean: if the current target is 20 and the latest status is `off`, as temperature closens to 19.4, poll more frequently.
      if the the latest status is `on`, as temperature closens to 20, poll more frequently.
      if the temperature is far away from the "trigger" temperature (either 19.4 or 20) no need to poll as frequently.

  This can be applied to both fetchBoilerStatus and fetchBoilerStatusHistory.