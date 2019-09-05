[![Build Status](https://travis-ci.org/bobvanhesse/git-to-tempo.svg?branch=master)](https://travis-ci.org/bobvanhesse/git-to-tempo)

# Git to Tempo
Converts your git log into Tempo entries based on your working hours.

## Background
The conversion of hours spent on development to a time tracker entry can be a
though task. Development is a creative process that is not easily measurable.
If we think of a strategy to tackle an issue just before falling asleep, we
don't include this in our time tracking logs. Simultaneously, if we learn about
new techniques or make mistakes while developing at the office, this might be
reported as time spent on a ticket. As by definition the conversion of a multi-
dimensional process to a single-dimensional time registration is arbitrary and
will likely result in a **questionable representation**.

The time registration can be a frustrating task for a developer, due to the
stressful questions the process raises: Is it fair to charge a client for all
of the hours spent on a ticket? Is my boss asking me to submit time tracking
because he or she doesn't trust me?

Often employers are well aware of the dificulty of this task. An employer could
have many reasons to request time tracking. Analytical purposes and reporting to
clients, investors or governmental institutions and are much more common reasons
than distrust.

## Goal
This module was built for developers who do not want to spend their time on
writing a representation that is highly questionable, yet do not want to
disobbey their employer's demand either. If you think of time reports as an
approximation, this module will give you just what you need. These generated
time logs will provide you with a representation that is __arguably__ just as
questionable as customly written entries. Whether you want to use the logs as
a starting point or as a final report is completely up to you!
