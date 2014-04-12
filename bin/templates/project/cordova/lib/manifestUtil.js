/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var fs = require('fs'),
  path = require('path'),
  xml2js = require('xml2js');

var attrKey = '$';

exports.updateManifestPermissions = function (projectPath) {
  var manifestPath = path.join(projectPath, 'www/manifest.webapp'),
    configXmlPath = path.join(projectPath, 'config.xml'),
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')),
    configXml = fs.readFileSync(configXmlPath, 'utf-8'),
    xmlParser = new xml2js.Parser({async: false, trim: true, attrKey: attrKey}),
    xmlData = {};

  xmlParser.parseString(configXml, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      xmlData = result;
    }
  });

  if (xmlData.widget && xmlData.widget.permission) {
    var permissionXmlNode = xmlData.widget.permission;
    var permissions = {};

    permissionXmlNode.forEach(function(node) {
      var nodeInfo = node[attrKey];

      permissions[nodeInfo.name] = {
        description: nodeInfo.description
      };

      // Access is optional
      if (nodeInfo.access) {
        permissions[nodeInfo.name].access = nodeInfo.access;
      }
    });

    manifest.permissions = permissions;
  } else if (manifest.permissions) {
    // Clear permissions in case all plugins requiring permissions were removed.
    delete manifest.permissions;
  }

  console.log('Updating manifest.webapp');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, '  '), 'utf-8');
};
