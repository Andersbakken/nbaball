#!/usr/bin/env node

var fs = require('fs');

var teams = {};
var opponents = [];

var team = "Rico Suave";

function compareResults(a, b)
{
    var wins = 0;
    var losses = 0;
    for (var i=0; i<a.length; ++i) {
        if (a[i] == b[i])
            continue;
        if ((a[i] > b[i]) == (i != 7)) {
            ++wins;
        } else {
            ++losses;
        }
    }
    return wins - losses;
}

function parseFile(file)
{
    var text = fs.readFileSync(file, 'utf8');
    // var tableStart = text.indexOf("<table width");
    var last = 0;
    var nextIsOpponent;
    var lastResult;
    for (var i=0; i<8; ++i) {
        var idx = text.indexOf('linescoreTeamRow', last);
        var end = text.indexOf('</tr>', idx);
        var fields = text.substring(idx, end).split(/<[^>]*>/).filter(x => x);
        // console.log(fields);
        if (!(fields[1] in teams)) {
            teams[fields[1]] = [];
        }
        var games = teams[fields[1]];
        var res = [fields[4], fields[5], fields[6], fields[7], fields[8], fields[9], fields[10], fields[12]];
        games.push(res);
        if (nextIsOpponent) {
            opponents.push({team: fields[1], result: res});
            nextIsOpponent = false;
        }
        if (fields[1] == team) {
            if (i % 2 == 0) {
                nextIsOpponent = true;
            } else {
                opponents.push(lastResult);
            }
        }
        lastResult = {team: fields[1], result: res};
        // console.log(fields);
        last = end;

    }
}

// if (process.argv.length > 2)
//     team = process.argv[2];

for (var i=1; i<=20; ++i)
    parseFile(`${i}.html`);
// console.log(teams["Rico Suave"]);
// console.log(opponents);

function run(team)
{
    console.log(`Team: ${team}`);
    var results = teams[team];
    var total = 0;
    for (var i=0; i<opponents.length; ++i) {
        let best;
        let bestScore;
        for (var j=0; j<results.length; ++j) {
            var score = compareResults(results[j], opponents[i].result);
            if (best === undefined || score > bestScore) {
                bestScore = score;
                best = j;
            }
        }
        total += bestScore;
        console.log(`Game ${i} against ${opponents[i].team} best score was ${bestScore} game ${best}`);
    }
    console.log(`Total score ${total} average ${total / opponents.length}\n`);
}

Object.keys(teams).forEach(run);
