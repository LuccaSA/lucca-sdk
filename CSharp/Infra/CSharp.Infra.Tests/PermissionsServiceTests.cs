using System;
using NUnit.Framework;
using RDD.Domain.Contexts;
using RDD.Domain;
using RDD.Infra.Logs;
using Lucca.CSharpSDK.Infra.Common;

namespace Lucca.CSharpSDK.Infra.Tests
{
	public class PermissionsServiceTests
	{
		[Test]
		public void HasUserPermissionShoulReturnNonEmptyCollectionWhenUserHasPermission()
		{
			RDD.Infra.BootStrappers.TestsBootStrapper.ApplicationStart();
			RDD.Infra.BootStrappers.TestsBootStrapper.ApplicationBeginRequest();

			Resolver.Current().Register<ILogService>(() => new LostLogService());

			var instanceUri = new Uri("https://pandora.lucca.local");
			var token = new Guid("fdfc9dbc-c19f-4f85-b9c7-fa32d813b1a5");

			var settings = new ApiSettings(instanceUri, new AuthenticationInfo(AuthenticationType.User, token));

			var service = new v2.PermissionsService(settings);

			var hasPermisson = service.HasUserPermission(22, 1);

			Assert.IsTrue(hasPermisson);
		}
	}
}
