Ext.ux.KISSmetrics
==================

A light wrapper around the [KISSmetrics](http://kissmetrics.com/) API for use in an ExtJS application.
Exposes KISSmetrics API in a ExtJS-friendly way providing simple functions to integrate with your apps.
Provides a config 'KISSmetrics' on the main application to configure the API key and optionally a list of all the KISSmetrics events you define (this will be used eventually to provide warnings when you record an event that wasn't defined).


      Ext.application({
          name: 'MyApp',
          ...
          paths: {
              'Ext.ux': 'app/ux'
          },
          KISSmetrics: {
              key: 'your KISSmetrics api key',
              events: [
                  'KM event1',
                  'KM event2',
                  'KM event3'
              ]
          }
      });
 
      Ext.KISSmetrics.identify('user@mycompany.com');
      Ext.KISSmetrics.record('KM event1', { id: 123234 });
      Ext.KISSmetrics.record('KM event2', { id: 6454 });
      Ext.KISSmetrics.record('KM event3');
      Ext.KISSmetrics.record('KM event1', { id: 100000 });
      Ext.KISSmetrics.clearIdentity();

The KISSmetrics API documentation can be found [here](http://support.kissmetrics.com/apis/javascript/).

If you attempt to record a KISSmetrics event/action that hasn't been listed in the main Application-level KISSmetrics config object then a warning is output on Ext.log...these log messages do nothing in a release/production build.
