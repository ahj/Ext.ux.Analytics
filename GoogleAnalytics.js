/*!
 * Ext.ux.GoogleAnalytics
 * http://github.com/ahj/Ext.ux.Analytics
 *
 * Copyright 2014 Alun Huw Jones
 * Released under the MIT license
 * Check MIT-LICENSE.txt
 */
 /*
 * @class Ext.ux.GoogleAnalytics
 * @extend Ext.app.Controller
 * 
 * Enables Google Analytics integration for Ext JS 4 MVC architecture.
 * 
 *      Ext.application({
 *          name: 'MyApp',
 *          ...
 *          paths: {
 *              'Ext.ux': 'app/ux'
 *          },
 *          GoogleAnalytics: {
 *              trackingCode: 'your tracking code'
 *          }
 *      });
 * 
 * @docauthor Alun Huw Jones
 */
Ext.define('Ext.ux.GoogleAnalytics', {
    singleton: true,
    alternateClassName: 'Ext.GoogleAnalytics',
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: [
        'Ext.app.Application'
    ],
    
    // @private
    constructor: function() {
        var me = this;
        me.ready = false;
        me.configured = false;
        me.GoogleAnalytics = {};
        me.mixins.observable.constructor.call(me);
    },
    
    /**
     * Processes the config for the given app.
     * @private
     */
    init: function(app) {
        var me = this;
        
        if (!app || !app.GoogleAnalytics) {
            return;
        }
        
        me.processConfig(app);
            
        if (me.ready || !me.configured) {
            return;
        }
        me.ready = true;
        
        me.addEvents(
            /**
             * @event ga_track_event
             * Fires when an event is tracked
             * @param {String} category
             * @param {String} action
             */
            'ga_track_event' 
        );
        
        Ext.onReady(function() {
       	    // Ensure that the globally-scoped queue variable is defined
            var _q = _gaq || [],
                url = (document.location.protocol === 'https:')
                    ? https://ssl.google-analytics.com/ga.js
                    : http://www.google-analytics.com/ga.js;

            _q.push(['_setAccount', me.trackingCode]);
            _q.push(['trackPageview']);

       	    me._gas(url);
        });
    },

    /**
     * Validate configuration.
     * @private
     */
    processConfig: function(app) {
        var me = this,
            config = app.GoogleAnalytics,
            events = config.events || [];
        
        if (!config.trackingCode) {
    	    Ext.log.error('ga: tracking code is missing from config');
            return false;
        }
        
        me.trackingCode = config.trackingCode;

        me.configured = true;
    },

    /**
     * Method used to load in to the current page the Google Analytics
     * JavaScript code needed to support reading the _gmq queue and 
     * pushing items found there to the Google Analytics servers
     * using Ajax calls.
     *
     * @param {String} url  The url of a JavaScript file to be loaded
     */
    _gas: function(url) {
        setTimeout(function() {
    	    var d = document,
    	        f = d.getElementsByTagName('script')[0],
                s = d.createElement('script');
    	    
    	    s.type = 'text/javascript';
    	    s.async = true;
    	    s.src = url;
    	    f.parentNode.insertBefore(s, f);
    	}, 1);
    },

    /**
     * Issues a track event to the Google Analytics server.
     *
     * @param {String} category  The name you supply for the group of objects you want to track.
     * @param {String} action  A string that is uniquely paired with each category and commonly used
     *                         to define the type of user interaction for the web object.
     * @param {String} label   An optional string to provide additional dimensions to the event data.
     * @param {Number} value   An integer that you can use to provide additional dimensions to the event data.
     * @param {Boolean) noninteraction  A boolean that whe set to true, indicates that the event hit
     *                                  will not be used in bounce-rate calculation.
     * @return {Boolean}  true if the function was successful otherwise false
     */
    trackEvent: function(category, action, label, value, noninteraction) {
        var me = this,
            args = ['_trackEvent'];

    	if (!category || !Ext.isString(category)) {
    	    Ext.log.error('trackEvent: category arg not defined or not a string');
    	    return false;
    	}

        args.push(category);

    	if (!action || !Ext.isString(action)) {
    	    Ext.log.error('trackEvent: action arg not defined or not a string');
    	    return false;
    	}

        args.push(action);

        if (label) {
            args.push(label);
        }

        if (value) {
            args.push(value);
        }

        if (noninteraction) {
            args.push(noninteraction);
        }

        _gaq.push(args);

        me.fireEvent('ga_track_event', category, action);

        return true;
    }
},
function() {
    /*
     * Patch Ext.Application to auto-initialize Google Analytics tracker
     */
    Ext.override(Ext.app.Application, {
        enableGoogleAnalytics: true,
        onBeforeLaunch: function() {
            this.callOverridden();
        
            if (this.enableGoogleAnalytics) {
                Ext.ux.GoogleAnalytics.init(this);
            }
        }
    });
});
