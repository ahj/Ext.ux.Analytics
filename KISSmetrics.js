/*!
 * Ext.ux.KISSmetrics
 * http://github.com/ahj/Ext.ux.Analytics
 *
 * Copyright 2014 Alun Huw Jones
 * Released under the MIT license
 * Check MIT-LICENSE.txt
 */
 /*
 * @class Ext.ux.KISSmetrics
 * @extend Ext.app.Controller
 * 
 * Enables KISSmetrics integration for Ext JS 4 MVC architecture.
 * Exposes a basic set of KISSmetrics API to application developers with easy
 * configuration and integration at the application level.
 * Can define a list of KISSmetrics actions/events which helps validate/
 * catch unsupported events by logging unknowns.
 * 
 *      Ext.application({
 *          name: 'MyApp',
 *          ...
 *          paths: {
 *              'Ext.ux': 'app/ux'
 *          },
 *          KISSmetrics: {
 *              key: 'your KISSmetrics api key',
 *              events: [
 *                  'KM event1',
 *                  'KM event2',
 *                  'KM event3'
 *              ]
 *          }
 *      });
 * 
 *      Ext.KISSmetrics.identify('user@mycompany.com');
 *      Ext.KISSmetrics.record('KM event1', { id: 123234 });
 *      Ext.KISSmetrics.record('KM event2', { id: 6454 });
 *      Ext.KISSmetrics.record('KM event3');
 *      Ext.KISSmetrics.record('KM event1', { id: 100000 });
 *      Ext.KISSmetrics.clearIdentity();
 *
 * @docauthor Alun Huw Jones
 */
Ext.define('Ext.ux.KISSmetrics', {
    singleton: true,
    alternateClassName: 'Ext.KISSmetrics',
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
        me.KISSmetrics = {};
        me.mixins.observable.constructor.call(me);
    },
    
    /**
     * Processes the config for the given app.
     * Sets up the KISSmetrics api key and any events that were defined.
     * Lastly, it sets up the _kmk and _kmq global variables and registers 
     * an onReady function to load the necessary KISSmetrics JavaScript in
     * to the page.
     * @private
     */
    init: function(app) {
        var me = this;
        
        if (!app || !app.KISSmetrics) {
            return;
        }
        
        me.processConfig(app);
            
        if (me.ready || !me.configured) {
            return;
        }
        me.ready = true;
        
        me.addEvents(
            /**
             * @event km_identify
             * Fires when a user is identified to KISSmetrics
             * @param {String} user The user identity
             */
            'km_identify', 
        
            /**
             * @event km_clear_identity
             * Fires when the user's identity is cleared in KISSmetrics
             */
            'km_clear_identity', 
        
            /**
            * @event km_set
            * Fires after saving additional properties about the identified user in KISSmetrics
            * @param {Object} properties An object of key-value pairs that further identify
            *                 the user, e.g. segment groups of people into cohorts.
            */
            'km_set',
            
            /**
             * @event km_record
             * Fires after tracking an action or metric event in KISSmetrics
             * @param {String} event The metric action or event that was tracked.
             * @param {Object} properties Custom properties of the event.
             */
             'km_record'
        );
        
        Ext.onReady(function() {
       	    // Ensure that the globally-scoped KISSmetrics variables are defined
            var _kmq = _kmq || [],
                _kmk = _kmk || me.apiKey;

            // Get the KISSmetrics JavaScript loaded
       	    me._kms('//i.kissmetrics.com/i.js');
       	    me._kms('//doug1izaerwt3.cloudfront.net/' + _kmk + '.1.js');
        });
    },

    /**
     * Validate configuration.
     * @private
     */
    processConfig: function(app) {
        var me = this,
            config = app.KISSmetrics,
            events = config.events || [];
        
        if (!config.key) {
    	    Ext.log.error('km: api key is missing from config');
            return false;
        }
        
        me.apiKey = config.key;

        if (!Ext.isArray(config.events)) {
    	    Ext.log.warn('km: events in config is not an array');
    		
    	    // reset to empty array since configured value is invalid
    	    events = [];
        }
        	
        me.events = events;
        	
        me.configured = true;
    },

    /**
     * Method provided by KISSmetrics that is used to load in to the current
     * page the KISSmetrics JavaScript code needed to support reading the
     * _kmq queue and pushing items found there to the KISSmetrics servers
     * using Ajax calls.
     *
     * @param {String} url  The url of a JavaScript file to be loaded
     */
    _kms: function (url) {
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
     * Identify your users.
     * To get the best results you should identify your known users once they
     * have logged in or signed up.
     * 
     * @param {String} user A string value identifying the user
     * @return {Boolean}  true if the function was successful otherwise false
     */
    identify: function(user) {
    	var me = this,
    	    args = ['identifty'];

        if (!Ext.isString(user)) {
    	    Ext.log.error('km identify: user arg is not a string');
       	    return false;
        }
        
      	args.push(user);
	
	_kmq.push(args);

	me.fireEvent('km_identity', user);

	return true;
    },
    
    /**
     * Set additional properties about the user, which you can use to segment
     * groups of people into cohorts.
     * 
     * @param {Object} properties An object of key value pairs to associate
     *                            with the current user
     * @return {Boolean}  true if the function was successful otherwise false
     */
    set: function(properties) {
    	var me = this,
    	    args = ['set'];
    	
    	if (!properties || !Ext.isObject(properties)) {
    	    Ext.log.error('km set: properties arg is not an object');
    	    return false;
    	}

    	args.push(properties);
    	
        _kmq.push(args);
	
        me.fireEvent('km_set', properties);
		
        return true;
    },
    
    /**
     * If the current person is already 'identified', this clears their
     * identity and generates a new anonymous ID for their browser. Does
     * nothing if the current person is currently 'anonymous'.
     * 
     * @return {Boolean}  true if the function was successful otherwise false
     */
    clearIdentity: function() {
    	var me = this,
    	    args = ['clearIdentity'];
    	
	_kmq.push(args);
		
	me.fireEvent('km_clear_identity', user);
		
	return true;    	
    },
    
    /**
     * Records an event.
     * 
     * @param {String} event      The name of the event to record
     * @param {Object} properties An optional set of properties to associate
     *                            with the recorded event
     * @return {Boolean}  true if the function was successful otherwise false
     */
    record: function(event, properties) {
    	var me = this,
    	    args = ['record'],
            events = me.events;

    	if (!event || !Ext.isString(event)) {
    	    Ext.log.error('km record: event arg is not a string');
    	    return false;
    	}

        // Only produce warnings if the user has registered
        // at least one event in the global config
        if (events && (events.length > 0)) {
            var i,
                match = false;

            for (i = 0; i < events.length; i++) {
                if (event == (event[i] || '')) {
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                Ext.log.warn('km record: unknown event ' + event);
            }
        }

    	args.push(event);
 
    	if (properties) { 
            if (!Ext.isObject(properties)) {
                Ext.log.error('km record: properties arg for event ' + event + ' is not an object');
                return false;
            }

    	    args.push(properties);
    	}

  	_kmq.push(args);
  		
        me.fireEvent('km_record', event, properties);
        
        return true;
    }
},
function() {
    /*
     * Patch Ext.Application to auto-initialize KISSmetrics
     */
    Ext.override(Ext.app.Application, {
        enableKISSmetrics: true,
        onBeforeLaunch: function() {
            this.callOverridden();
        
            if (this.enableKISSmetrics) {
                Ext.ux.KISSmetrics.init(this);
            }
        }
    });
});
