using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Infra
{
	public enum ApiVersion { v2, v3 };

	public class ApiSettings
	{
		public Uri InstanceUri { get; private set; }
		public ApiVersion ApiVersion { get; private set; }
		public AuthenticationInfo AuthenticationInfo { get; private set; }

		public ApiSettings(Uri instanceUri, ApiVersion apiVersion, AuthenticationInfo authenticationInfo)
		{
			InstanceUri = instanceUri;
			ApiVersion = apiVersion;
			AuthenticationInfo = authenticationInfo;
		}
	}
}
