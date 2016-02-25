using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Infra.Common
{
	public enum ApiVersion { v2, v3 };

	public class ApiSettings
	{
		public Uri InstanceUri { get; private set; }
		public AuthenticationInfo AuthenticationInfo { get; private set; }

		public ApiSettings(Uri instanceUri, AuthenticationInfo authenticationInfo)
		{
			InstanceUri = instanceUri;
			AuthenticationInfo = authenticationInfo;
		}
		public ApiSettings(string instanceUri, AuthenticationInfo authenticationInfo)
			: this(new Uri(instanceUri), authenticationInfo) { }
	}
}
