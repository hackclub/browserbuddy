var initialinfo = document.getElementById("info")
initialinfo.removeAttribute('id');

var table = document.getElementById("info")

var titleRow = table.insertRow(-1);
var titleText = titleRow.insertCell(0);
titleText.outerHTML = "<br><h4>VRC Data Analysis Stats</h4>";

var tsRow = table.insertRow(-1);
var trueSkillRank = tsRow.insertCell(0);
var trueSkillRankValue = tsRow.insertCell(1);
trueSkillRank.outerHTML = "<th>TrueSkill Rank:</th>";

var recordRow = table.insertRow(-1);
var record = recordRow.insertCell(0);
var recordValue = recordRow.insertCell(1);
record.outerHTML = "<th>W-L-T:</th>";

var breakRow = table.insertRow(-1);
breakRow.outerHTML = "<br>";

var skillsRow = table.insertRow(-1);
var skillsRank = skillsRow.insertCell(0);
var skillsRankValue = skillsRow.insertCell(1);
skillsRank.outerHTML = "<th>Skills Rank:</th>";

var totalRow = table.insertRow(-1);
var total = totalRow.insertCell(0);
var totalValue = totalRow.insertCell(1);
total.outerHTML = "<th>Combined Skills:</th>";

var driverRow = table.insertRow(-1);
var driver = driverRow.insertCell(0);
var driverValue = driverRow.insertCell(1);
driver.outerHTML = "<th>Driver:</th>";

var autonRow = table.insertRow(-1);
var auton = autonRow.insertCell(0);
var autonValue = autonRow.insertCell(1);
auton.outerHTML = "<th>Auton:</th>";

var breakRow1 = table.insertRow(-1);
breakRow1.outerHTML = "<br>";

var ccwmRow = table.insertRow(-1);
var ccwm = ccwmRow.insertCell(0);
var ccwmValue = ccwmRow.insertCell(1);
ccwm.outerHTML = "<th>CCWM:</th>";

var wpMatchRow = table.insertRow(-1);
var wpMatch = wpMatchRow.insertCell(0);
var wpMatchValue = wpMatchRow.insertCell(1);
wpMatch.outerHTML = "<th>AVG WP/Match:</th>";

var awpMatchRow = table.insertRow(-1);
var awpMatch = awpMatchRow.insertCell(0);
var awpMatchValue = awpMatchRow.insertCell(1);
awpMatch.outerHTML = "<th>AWP%:</th>";

function fetchTeamInfo (teamNumber) {
    const database = "https://cors.rare1k.dev/?https://vrc-data-analysis.com/v1/team/" + teamNumber
    let fetchRes = fetch(
        database,
        {
            method: 'GET'
        }
    ); 

    fetchRes.then(res => res.json()).then(d => {
        var teamData = {}
        teamData = d

        trueSkillRankValue.innerHTML = `#${teamData.trueskill_ranking}`
        recordValue.innerHTML = `${teamData.total_wins}-${teamData.total_losses}-${teamData.total_ties} // ${(teamData.total_wins / (teamData.total_wins + teamData.total_losses) * 100).toFixed(1)}%`
        driverValue.innerHTML = teamData.score_driver_max
        autonValue.innerHTML = teamData.score_auto_max
        totalValue.innerHTML = teamData.score_driver_max+teamData.score_auto_max;
        ccwmValue.innerHTML = teamData.ccwm
        wpMatchValue.innerHTML = teamData.wp_per_match
        awpMatchValue.innerHTML = `${(teamData.awp_per_match*100).toFixed(1)}%`

    })
}

function fetchSkillsRank (teamNumber) {
	const x = atob("ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKU1V6STFOaUo5LmV5SmhkV1FpT2lJeklpd2lhblJwSWpvaU1tVTJaVFJqWVdGbFlqUmhOMlV5WmpaalkyUXlaV1pqWlRJd09UTXlPR00wTnpBMVlUazRNMlkwTjJWaU1Ua3daR1UzTXpZNU56WTBaR001TmpJd09EUXlOMkkzTTJZd09EWTJaVEl4TVdRaUxDSnBZWFFpT2pFM016azJPVEV6TlRJdU16QXhOamd4TENKdVltWWlPakUzTXprMk9URXpOVEl1TXpBeE5qZ3lMQ0psZUhBaU9qSTJPRFl6TnpZeE5USXVNamc0T0RZek1pd2ljM1ZpSWpvaU1UTTVOakk1SWl3aWMyTnZjR1Z6SWpwYlhYMC5odW5NVHdzdUpidWV5Vm9iLVRvWkFtUXl4NjFIdUY4V1pKRWdFbVpzUUtGX2hoRk8wRjBIUjNmZlVacjVySzNTUlFVZlVCUThjd1FEcmlHV2V2elNpVTN0T1VKbFpSVG82ZTZwT3BGY2RIa19lM1B4ZHBYM0NTNnZPTnNnTVdsSmtjWFFuZE1oYXg4LWxWZVRiRThJZEJPc1lkN1JzRzl1T0ZZNy1HVVNRaksyNU9ESU5ZUWdQd2d3R3pqb0txcVRHUlZSYnhGUkNxMmM2SWRpNjloZDZQaHB2QzV6WGZiY3ZVcjFvUVBYcThjZlBoZWFKY1NXNnU1ZEMwWE9Db3AyVnF0bXhjaS1CbTZBYUpDYy1UQ3k4NURDR0ZncExSc3BsSWozNTgweWJEUTcyTWZqWkpWdlpOeVFaajRsUWVIejhKMDZBN1BoUk41U1RpUFBReTdNSGZkQlg3NXVhTVZHRE9PUXZlWkJOTXVIQU1EWmpvMTdDc0FFdUNPZU53YkxGTkxfYjRmbXV6N0pxTWRzSHRQdFJWMEw5ekRUVWpkd3ZSbV9RQnFrZzJmTUIyZ2pQVTBCbi1QbmxKY01FaEhReks2SHJSUGF6X3hWbGo5LXA0ZmNPSE5YVzFkc2MzSUlzbGlEYWZ5c2ZUa0VxaXVhRVNCWmxvUWo1d2dUbDNLLXBJOFZvWjZhSk80cXJaR19sYUVoVjRaSDB6QVN6UE1UZlhuX0l3NmtvcUhheWRlcUVvVG9CaU52cGhkeEFic29uUGJGUEg4V0lPU295Y29oUmR0aV9FRkVpdXFQS1dxakRXMHVKLWttS2FHaFlkSXhldjJtSUVmbk42SjE2eWQ4THJmMkl4VFNXSC1majVNdnVNQ29ZWXBvN0xnaHpmd0xFLW9rSFhSdTNqMA==");
	var seasonID = "0";
	
	// get season id
	const response = fetch("https://www.robotevents.com/api/v2/seasons?program%5B%5D=1&active=true", {
		method: "GET",
        headers: {
			Authorization: `Bearer ${x}`
        }
	});
	response.then(res => res.json()).then(d => {
        seasonID = d.data[0].id;
		console.log(seasonID);
		
		// pull skills rankings
		const url = `https://www.robotevents.com/api/seasons/${seasonID}/skills`;
		const response1 = fetch(url, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${x}`
			}
		});
	
		response1.then(res => res.json()).then(d => {
			var teamData = {}
			teamData = d
		
			const teamObject = teamData.find(r => r.team.team === teamNumber);
			skillsRankValue.innerHTML = teamObject.rank;
		})
	})

}

if (document.getElementsByClassName("active")[0].innerHTML == "Info") {
    fetchTeamInfo(window.location.href.slice(39).toUpperCase()) // chops off beginning of url to get team number
    fetchSkillsRank(window.location.href.slice(39).toUpperCase())
}

