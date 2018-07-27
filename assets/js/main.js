require('../css/main.css');
require('../css/font-awesome.min.css');

require('babel-register');
require('babel-polyfill');

require('../js/util');
const u2f = require('../js/u2f-api');

import LedgerProvider from 'web3-provider-ledger';
import LedgerDevice from 'web3-provider-ledger/device';

const abi = require('../../build/contracts/Subscribers.json').abi;
const address = (location.hostname == "localhost") ? '0x3134bcded93e810e1025ee814e87eff252cff422' : '0x484637c005c96e9308525c2019430f6846157157';
const ethRpc = (location.hostname == "localhost") ? 'http://127.0.0.1:7545' : 'https://mainnet.infura.io/v3/eab9584c1d3f4e47aa7530bcd9b5ac33';

var web3net;
var SubsContract;

var settings = {

	banner: {

		// Indicators (= the clickable dots at the bottom).
			indicators: true,

		// Transition speed (in ms)
		// For timing purposes only. It *must* match the transition speed of "#banner > article".
			speed: 1500,

		// Transition delay (in ms)
			delay: 5000,

		// Parallax intensity (between 0 and 1; higher = more intense, lower = less intense; 0 = off)
			parallax: 0.25

	}

};

(function($) {

	skel.breakpoints({
		xlarge:	'(max-width: 1680px)',
		large:	'(max-width: 1280px)',
		medium:	'(max-width: 980px)',
		small:	'(max-width: 736px)',
		xsmall:	'(max-width: 480px)'
	});

	/**
	 * Applies parallax scrolling to an element's background image.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._parallax = (skel.vars.browser == 'ie' || skel.vars.mobile) ? function() { return $(this) } : function(intensity) {

		var	$window = $(window),
			$this = $(this);

		if (this.length == 0 || intensity === 0)
			return $this;

		if (this.length > 1) {

			for (var i=0; i < this.length; i++)
				$(this[i])._parallax(intensity);

			return $this;

		}

		if (!intensity)
			intensity = 0.25;

		$this.each(function() {

			var $t = $(this),
				on, off;

			on = function() {

				$t.css('background-position', 'center 100%, center 100%, center 0px');

				$window
					.on('scroll._parallax', function() {

						var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);

						$t.css('background-position', 'center ' + (pos * (-1 * intensity)) + 'px');

					});

			};

			off = function() {

				$t
					.css('background-position', '');

				$window
					.off('scroll._parallax');

			};

			skel.on('change', function() {

				if (skel.breakpoint('medium').active)
					(off)();
				else
					(on)();

			});

		});

		$window
			.off('load._parallax resize._parallax')
			.on('load._parallax resize._parallax', function() {
				$window.trigger('scroll');
			});

		return $(this);

	};

	/**
	 * Custom banner slider for Slate.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._slider = function(options) {

		var	$window = $(window),
			$this = $(this);

		if (this.length == 0)
			return $this;

		if (this.length > 1) {

			for (var i=0; i < this.length; i++)
				$(this[i])._slider(options);

			return $this;

		}

		// Vars.
			var	current = 0, pos = 0, lastPos = 0,
				slides = [], indicators = [],
				$indicators,
				$slides = $this.children('article'),
				intervalId,
				isLocked = false,
				i = 0;

		// Turn off indicators if we only have one slide.
			if ($slides.length == 1)
				options.indicators = false;

		// Functions.
			$this._switchTo = function(x, stop) {

				if (isLocked || pos == x)
					return;

				isLocked = true;

				if (stop)
					window.clearInterval(intervalId);

				// Update positions.
					lastPos = pos;
					pos = x;

				// Hide last slide.
					slides[lastPos].removeClass('top');

					if (options.indicators)
						indicators[lastPos].removeClass('visible');

				// Show new slide.
					slides[pos].addClass('visible').addClass('top');

					if (options.indicators)
						indicators[pos].addClass('visible');

				// Finish hiding last slide after a short delay.
					window.setTimeout(function() {

						slides[lastPos].addClass('instant').removeClass('visible');

						window.setTimeout(function() {

							slides[lastPos].removeClass('instant');
							isLocked = false;

						}, 100);

					}, options.speed);

			};

		// Indicators.
			if (options.indicators)
				$indicators = $('<ul class="indicators"></ul>').appendTo($this);

		// Slides.
			$slides
				.each(function() {

					var $slide = $(this),
						$img = $slide.find('img');

					// Slide.
					if ($img.attr('src')) {
						$slide.css('background-image', 'url("' + $img.attr('src') + '")');
					}
						$slide.css('background-position', ($slide.data('position') ? $slide.data('position') : 'center'));

					// Add to slides.
						slides.push($slide);

					// Indicators.
						if (options.indicators) {

							var $indicator_li = $('<li>' + i + '</li>').appendTo($indicators);

							// Indicator.
								$indicator_li
									.data('index', i)
									.on('click', function() {
										$this._switchTo($(this).data('index'), true);
									});

							// Add to indicators.
								indicators.push($indicator_li);

						}

					i++;

				})
				._parallax(options.parallax);

		// Initial slide.
			slides[pos].addClass('visible').addClass('top');

			if (options.indicators)
				indicators[pos].addClass('visible');

		// Bail if we only have a single slide.
			if (slides.length == 1)
				return;

		// Main loop.
			intervalId = window.setInterval(function() {

				current++;

				if (current >= slides.length)
					current = 0;

				$this._switchTo(current);

			}, options.delay);

	};

	$(function() {

		var	$window 	= $(window),
			$body 		= $('body'),
			$header 	= $('#header'),
			$banner 	= $('.banner');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 100);
			});

		// Prioritize "important" elements on medium.
			skel.on('+medium -medium', function() {
				$.prioritize(
					'.important\\28 medium\\29',
					skel.breakpoint('medium').active
				);
			});

		// Banner.
			$banner._slider(settings.banner);

		// Menu.
			$('#menu')
				.append('<a href="#menu" class="close"></a>')
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'right'
				});

		// Header.
			if (skel.vars.IEVersion < 9)
				$header.removeClass('alt');

			if ($banner.length > 0
			&&	$header.hasClass('alt')) {

				$window.on('resize', function() { $window.trigger('scroll'); });

				$banner.scrollex({
					bottom:		$header.outerHeight(),
					terminate:	function() { $header.removeClass('alt'); },
					enter:		function() { $header.addClass('alt'); },
					leave:		function() { $header.removeClass('alt'); $header.addClass('reveal'); }
				});

			}
	});

})(jQuery);

(function(){
	// Check for presence of web3
	if (typeof web3 === 'undefined' || !web3) {
		// Web3 is missing, so MetaMask is not installed
		document.getElementById("premium_button2").disabled = "disabled";
		document.getElementById("premium_button2_explainer").style.display = "inline-block";
		web3net = new window.Web3(new window.Web3.providers.HttpProvider(ethRpc));
	} else {
		// Web3 is here, so activate the button
		if (web3.eth.accounts.length == 0) {
			document.getElementById("premium_button2").disabled = "disabled";
			document.getElementById("premium_button2_explainer").innerText = "Please log into MetaMask first";
			document.getElementById("premium_button2_explainer").style.display = "inline-block";
		} else {
			document.getElementById("premium_button2").addEventListener("click", () => {subscribe('mm')});
			web3.eth.defaultAccount = web3.eth.accounts[0];
			web3net = web3;
		}
	}
	// Activate the Ledger button
	document.getElementById("premium_button1").addEventListener("click", () => {subscribe('ledger')});
})();

function validateEmail(email) 
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function subscribe(method) {
	console.log("Subscribing with method: " + method);

	let duration = document.querySelector("input[name='type']:checked").value == 'monthly' ? 1 : 2;
	let email = document.querySelector('#letterfuelLF1337inptstEmail-premium').value;
	console.log("Subbing " + email + " for " + ((duration == 1) ? '1 month' : '1 year'));

	if (!validateEmail(email)) {
		alert("Invalid Email");
		return false;
	}

	console.log("Email okay");

	let priceMethod = (duration == 1) ? 'monthlyPrice' : 'annualPrice';

	if (method == "ledger") {
			console.log("Ledger mode");
			const device = new LedgerDevice({
							"accountIndex": 0,
							"appId": location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: ''),
							"u2f": u2f 
						});

			const web3ledger = new window.Web3(new LedgerProvider({device}));
			web3ledger.eth.defaultAccount = web3ledger.eth.accounts[0];
			console.log(web3ledger);

			web3net.eth.contract(abi).at(address)[priceMethod](async function(error, result) {

				console.log("Successfully called contract method");
				console.log(error);
				console.log(result);

				if (error) {
					alert("Could not fetch price");
					return false;
				}

				let tx = await web3ledger.eth.contract(abi).at(address).subscribeMe(duration, web3net.fromAscii(web3net.sha3(email)), {
					value: result.toString(10), // BigNumber object
					gas: 90000
					});

				web3net.sendRawTransaction(tx, function(e, r) {
					console.log(e);
					console.log(r);
				});
			});
	}

	if (method == "mm") {
		console.log("Metamask mode");

		SubsContract = web3net.eth.contract(abi).at(address);

		let encodedEmail = web3net.fromAscii(web3net.sha3(email));

		console.log(encodedEmail);
		
		SubsContract.checkExpires(encodedEmail, function(error, result) {
			
			if (error) {
				alert("Could not verify email - please email fintechfriday@pm.me");
				return false;
			}

			if (result > 0) {
				var r = confirm("You are already subscribed. If you'd like to extend your subscription, press OK.");
				if (r == false) {
					return false;
				}
			}

			SubsContract[priceMethod](async function(error, result) {
				if (error) {
					alert("Could not fetch price");
					return false;
				}
				SubsContract.subscribeMe(duration, encodedEmail, {
					value: result.toString(10), // BigNumber object
					gas: 90000
				}, function(e, r) {
					console.log(e);
					console.log(r);

					$('.premium_button').hide();
					$('#premium_thanks').show();
				});
			});
		});
	}
}