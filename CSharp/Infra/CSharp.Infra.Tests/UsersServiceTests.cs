using System;
using NUnit.Framework;
using RDD.Domain.Contexts;
using RDD.Domain;
using RDD.Infra.Logs;

namespace Lucca.CSharpSDK.Infra.Tests
{
	public class UsersServiceTests
	{
		[Test]
		public void GetAllShoulReturnNonEmptyCollectionOnSampleLuccaInstance()
		{
			RDD.Infra.BootStrappers.TestsBootStrapper.ApplicationStart();
			RDD.Infra.BootStrappers.TestsBootStrapper.ApplicationBeginRequest();

			Resolver.Current().Register<ILogService>(() => new LostLogService());

			var instanceUri = new Uri("https://sandbox.ilucca-demo.net");
			var token = new Guid("9cba0b77-2991-4443-989f-ebdf3956d4fb");

			var settings = new ApiSettings(instanceUri, ApiVersion.v3, new AuthenticationInfo(AuthenticationType.User, token));

			var service = new UsersService(settings);

			var allUsers = service.GetAll();

			Assert.IsNotEmpty(allUsers);
		}
	}
}
